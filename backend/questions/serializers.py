from rest_framework import serializers
from .models import Question, Option

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'score_value']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'category', 'question_text', 'field_type', 'display_order', 'options']

    def create(self, validated_data):
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options')
        instance.category = validated_data.get('category', instance.category)
        instance.question_text = validated_data.get('question_text', instance.question_text)
        instance.field_type = validated_data.get('field_type', instance.field_type)
        instance.display_order = validated_data.get('display_order', instance.display_order)
        instance.save()

        # Simple update for options: clear and create new
        instance.options.all().delete()
        for option_data in options_data:
            Option.objects.create(question=instance, **option_data)

        return instance