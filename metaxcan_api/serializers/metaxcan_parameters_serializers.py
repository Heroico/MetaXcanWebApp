__author__ = 'heroico'


from rest_framework import serializers
from metaxcan_api.models import MetaxcanParameters, TranscriptomeModelDB

class MetaxcanParametersSerializer(serializers.HyperlinkedModelSerializer):
    # TODO: implement user view
    owner = serializers.HyperlinkedRelatedField(view_name='user-detail', read_only=True)
    job = serializers.PrimaryKeyRelatedField(read_only=True)
    transcriptome = serializers.PrimaryKeyRelatedField(queryset=TranscriptomeModelDB.objects.all(), required=False)

    class Meta:
        model = MetaxcanParameters
        fields = ('id', 'job', 'owner', 'transcriptome', 'snp_column',
                  'other_allele_column', 'effect_allele_column',
                  'beta_column', 'beta_sign_column', 'p_column', )
        read_only_fields = ('id', )